from django.shortcuts import render


def client_index(request):
    return render(request, 'wagtailadminclient/index.html', {'foo': 'bar'})
