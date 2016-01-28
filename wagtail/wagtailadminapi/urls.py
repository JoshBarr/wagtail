from django.conf.urls import url
from django.contrib.auth.decorators import permission_required

from wagtail.wagtailadminapi.views import pages
from wagtail.utils.urlpatterns import decorate_urlpatterns

urlpatterns = [
    url(r'^pages/(\w+)/(\w+)/(\d+)/$', pages.list, name='pages'),
]


urlpatterns = decorate_urlpatterns(
    urlpatterns,
    permission_required(
        'wagtailadmin.access_admin',
        login_url='wagtailadmin_login'
    )
)
