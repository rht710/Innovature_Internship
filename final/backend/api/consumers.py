import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import QAMessage, Course, Notification
from urllib.parse import parse_qs

User = get_user_model()

class QAChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.course_id = self.scope['url_route']['kwargs']['course_id']
        self.room_group_name = f'chat_{self.course_id}'

        # Join room group
        try:
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
        except Exception as e:
            print(f"[Channels Warning] Failed to join group {self.room_group_name}: {e}")
            await self.close(code=1011)
            return

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        if hasattr(self, 'room_group_name'):
            try:
                await self.channel_layer.group_discard(
                    self.room_group_name,
                    self.channel_name
                )
            except Exception:
                pass

    # Receive message from WebSocket
    async def receive_json(self, content):
        message = content.get('message')
        user_id = content.get('user_id')
        parent_id = content.get('parent_id') # For threaded replies

        if not message or not user_id:
            return

        # Save to DB
        qa_message = await self.save_message(user_id, self.course_id, message, parent_id)
        if qa_message:
            # Send message to room group
            try:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': qa_message
                    }
                )
            except Exception as e:
                print(f"[Channels Warning] Failed to send chat message to group {self.room_group_name}: {e}")

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        # Send message to WebSocket
        await self.send_json(message)

    @database_sync_to_async
    def save_message(self, user_id, course_id, message, parent_id):
        try:
            user = User.objects.get(id=user_id)
            course = Course.objects.get(id=course_id)
            parent = None
            if parent_id:
                parent = QAMessage.objects.get(id=parent_id)

            msg = QAMessage.objects.create(
                user=user,
                course=course,
                parent_message=parent,
                message=message
            )
            return {
                'id': str(msg.id),
                'course': str(msg.course_id),
                'user': str(msg.user_id),
                'user_name': msg.user.username,
                'parent_message': str(msg.parent_message_id) if msg.parent_message else None,
                'message': msg.message,
                'created_at': msg.created_at.isoformat(),
                'replies': []
            }
        except Exception as e:
            print("Error saving QA message:", e)
            return None


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        # We can extract user_id from query string or authentication
        # For simplicity in testing/local workspace, let's parse it from query string
        query_params = parse_qs(self.scope['query_string'].decode())
        user_id = query_params.get('user_id', [None])[0]

        if user_id:
            self.user_id = user_id
            self.group_name = f'notifications_{self.user_id}'

            try:
                await self.channel_layer.group_add(
                    self.group_name,
                    self.channel_name
                )
            except Exception as e:
                print(f"[Channels Warning] Failed to join notification group {self.group_name}: {e}")
                await self.close(code=1011)
                return

            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            try:
                await self.channel_layer.group_discard(
                    self.group_name,
                    self.channel_name
                )
            except Exception:
                pass

    async def send_notification(self, event):
        notification = event['notification']
        await self.send_json(notification)
