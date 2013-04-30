from django.shortcuts import get_object_or_404, render, render_to_response
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.template import RequestContext
from cart.models import Choice, Poll, ExtData
from fetchExternal import FetchExternal
from django.forms.models import model_to_dict
import datetime
import urllib
import json
import os
import time


def memorize(function):
    memo = {}

    def wrapper(*args):
        if args in memo:
            print "returning %s from cache" % memo[args]
            return memo[args]
        else:
            rv = function(*args)
            memo[args] = rv
        return rv
    return wrapper


def vote(request, poll_id):
    p = get_object_or_404(Poll, pk=poll_id)
    try:
        selected_choice = p.choice_set.get(pk=request.POST['choice'])
    except (KeyError, Choice.DoesNotExist):
        # Redisplay the poll voting form.
        return render(request, 'polls/detail.html', {
            'poll': p,
            'error_message': "You didn't select a choice.",
        })
    else:
        selected_choice.votes += 1
        selected_choice.save()
        # Always return an HttpResponseRedirect after successfully dealing
        # with POST data. This prevents data from being posted twice if a
        # user hits the Back button.
        return HttpResponseRedirect(reverse('polls:results', args=(p.id,)))


def app_view(request):
    return render_to_response('cart/index.html', {}, context_instance=RequestContext(request))


def app_child(request, id):
    print 'id:' + id
    return render_to_response('cart/partials/' + id + '.html', {}, context_instance=RequestContext(request))


def stock(request):
    #print json.dumps(get_all('GOOG'))
    names = ["GOOG", "MSFT", "ORCL"]
    #names = ["GOOG"]
    data = dict()
    for item in names:
        name = FetchExternal(name=item).getData()
        data[item] = name
    #return HttpResponse(data)
    return HttpResponse(json.dumps(data))


@memorize
def retrieveItems():
    data = list()
    dthandler = lambda obj: obj.isoformat() if isinstance(obj, datetime.datetime) else None
    for item in ExtData.objects.all():
        data.append(model_to_dict(item, fields=[], exclude=[]))
    return json.dumps(data, default=dthandler)


def getItems(request):
    return HttpResponse(retrieveItems())


def changeItems(request, id):
    print id
    return HttpResponse({})
