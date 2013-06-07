from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.conf import settings

admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'mysite.views.home', name='home'),
    # url(r'^mysite/', include('mysite.foo.urls')),
    url(r'^admin_tools/', include('admin_tools.urls')),
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^cart/', include('cart.urls', namespace="polls")),
    url(r'^admin/', include(admin.site.urls)),
)
print settings.STATIC_ROOT
if not settings.DEBUG:
    urlpatterns += patterns('',
        (r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_ROOT}),
    )
