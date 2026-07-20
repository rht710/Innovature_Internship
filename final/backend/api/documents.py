from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from .models import Course

@registry.register_document
class CourseDocument(Document):
    mentor = fields.ObjectField(properties={
        'id': fields.TextField(),
        'username': fields.TextField(),
    })

    class Index:
        # Name of the Elasticsearch index
        name = 'courses'
        # See Elasticsearch Indices API reference for available settings
        settings = {'number_of_shards': 1, 'number_of_replicas': 0}

    class Django:
        model = Course # The model associated with this Document

        # The fields of the model you want to be indexed in Elasticsearch
        fields = [
            'id',
            'title',
            'slug',
            'description',
            'price',
            'status',
            'average_rating',
            'created_at',
        ]

        # Ignore auto updating of Elasticsearch when a model is saved
        # or deleted:
        # ignore_signals = True

        # Don't perform an index refresh after every update (overrides global setting):
        # auto_refresh = False

        # Paginate the query that pulls database records to prevent transmission of too many records at once:
        # queryset_pagination = 500
