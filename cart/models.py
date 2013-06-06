from django.db import models
import datetime
from django.utils import timezone


class Poll(models.Model):
    question = models.CharField(max_length=200)
    pub_date = models.DateTimeField('date published')

    def __unicode__(self):
            return self.question

    def was_published_recently(self):
        now = timezone.now()
        return now - datetime.timedelta(days=1) <= self.pub_date < now
        was_published_recently.admin_order_field = 'pub_date'
        was_published_recently.boolean = True
        was_published_recently.short_description = 'Published recently?'


class Choice(models.Model):
    poll = models.ForeignKey(Poll)
    choice_text = models.CharField(max_length=200)
    votes = models.IntegerField(default=0)

    def __unicode__(self):
            return self.choice_text


class ExtData(models.Model):
    title = models.CharField(max_length=1000)
    cost = models.FloatField(default=0)
    duration = models.FloatField(default=0)
    done = models.BooleanField(default=False)
    eta = models.DateTimeField(default=datetime.date.today)


class UserListPost(models.Model):
    title = models.CharField(max_length=1000)
    data = models.CharField(max_length=10000000)
    #data = DictField()
    date = models.DateTimeField(default=datetime.date.today)
