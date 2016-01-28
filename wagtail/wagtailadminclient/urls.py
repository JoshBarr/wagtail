from django.conf.urls import url
from django.contrib.auth.decorators import permission_required

from wagtail.wagtailadminclient.views import client_index
from wagtail.utils.urlpatterns import decorate_urlpatterns

urlpatterns = [
    url(r'^', client_index, name='index'),
]

urlpatterns = decorate_urlpatterns(
    urlpatterns,
    permission_required(
        'wagtailadmin.access_admin',
        login_url='wagtailadmin_login'
    )
)
