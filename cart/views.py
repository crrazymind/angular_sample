from django.shortcuts import get_object_or_404, render, render_to_response
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.template import RequestContext
from cart.models import Choice, Poll, ExtData
from fetchExternal import FetchExternal
from django.forms.models import model_to_dict
import datetime
import time
import urllib
import json
import os
import time

from django.views.decorators.csrf import csrf_exempt


def memorize_old(function):
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


class memorize(object):
    def __init__(self, func):
        self.func = func
        self.cache = {}

    def __call__(self, *args):
        try:
            return self.cache[args]
        except KeyError:
            print "caching..."
            value = self.func(*args)
            self.cache[args] = value
            return value
        except TypeError:
         # uncachable -- for instance, passing a list as an argument.
         # Better to not cache than to blow up entirely.
            return self.func(*args)

    def __repr__(self):
        """Return the function's docstring."""
        return self.func.__doc__

    def __get__(self, obj, objtype):
        """Support instance methods."""
        fn = functools.partial(self.__call__, obj)
        fn.reset = self._reset
        return fn

    def _reset(self):
        self.cache = {}


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


#@csrf_exempt
def changeItems(request, id):
    if request.method == "POST" and id == "new":
        data = json.loads(request.raw_post_data)
        resTime = time.strptime(data["eta"], "%a, %d %b %Y %H:%M:%S %Z")
        resTime = datetime.datetime.fromtimestamp(time.mktime(resTime))
        res = ExtData(title=data["title"], cost=data["cost"], eta=resTime, done=data["done"], duration=data["duration"])
        res.save()
        retrieveItems._reset()
        retrieveItems()
        return HttpResponse(json.dumps({"status": "saved", "id": res.id}))
    return HttpResponse({})


def convertTime(timeToChange):
    resTime = time.strptime(timeToChange, "%a, %d %b %Y %H:%M:%S %Z")
    resTime = datetime.datetime.fromtimestamp(time.mktime(resTime))
    return resTime


def editItems(request, id):
    if request.method == "POST":
        data = json.loads(request.raw_post_data)
        data["eta"] = convertTime(data["eta"])
        item = ExtData.objects.get(id=id)
        item.__dict__.update(data)
        item.save()
        retrieveItems._reset()
        retrieveItems()
    return HttpResponse(json.dumps({"status": "saved", "id": item.id}))
