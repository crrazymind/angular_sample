from django.conf.urls import patterns, include, url
from django.views.generic import DetailView, ListView
from cart.models import Poll
from django.utils import timezone

urlpatterns = patterns('',
    url(r'^$',
    ListView.as_view(
        queryset=Poll.objects.filter(pub_date__lte=timezone.now)
            .order_by('-pub_date')[:5],
        context_object_name='latest_poll_list',
        template_name='polls/index.html'),
    name='index'),
    url(r'^(?P<pk>\d+)/$',
        DetailView.as_view(
            model=Poll,
            template_name='polls/detail.html'),
        name='detail'),
    url(r'^(?P<pk>\d+)/results/$',
        DetailView.as_view(
            model=Poll,
            template_name='polls/results.html'),
        name='results'),
    url(r'^(?P<poll_id>\d+)/vote/$', 'cart.views.vote', name='vote'),
    url(r'^app/partials/(?P<id>[a-zA-Z_.]\w*)', 'cart.views.app_child'),
    url(r'^app/', 'cart.views.app_view', name="stock"),
    url(r'^stock/', 'cart.views.stock'),
    url(r'^api/', 'cart.views.getItems'),
    url(r'^apiSet/(?P<id>\d+)', 'cart.views.changeItems'),
)
