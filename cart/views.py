from django.shortcuts import get_object_or_404, render, render_to_response
from django.http import HttpResponseRedirect, HttpResponse
from django.core.urlresolvers import reverse
from django.template import RequestContext
from cart.models import Choice, Poll, ExtData, UserListPost
from fetchExternal import FetchExternal
from django.forms.models import model_to_dict
import datetime
import time
import urllib2
import httplib
import json
import os
import time
import ast
from django.views.decorators.csrf import csrf_exempt


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


@memorize
def fromReddit(request):
    try:
        #url = 'http://www.reddit.com/r/all/.json'
        #url = 'http://www.reddit.com/user/GoodMorningWood/.json'
        url = 'http://www.reddit.com/.json'
        data = urllib2.urlopen(url)
        result = data.read()
        result = json.loads(result)
        return HttpResponse(json.dumps(result))
    except ValueError:
            print('Could not request data from server', ValueError)
            return HttpResponse({})


@memorize
def fromRedditUser(request):
    name = request.GET.dict()['user']
    print name
    try:
        #url = 'http://www.reddit.com/r/all/.json'
        url = 'http://www.reddit.com/user/' + name + '/.json'
        #url = 'http://www.reddit.com/.json'
        data = urllib2.urlopen(url)
        result = data.read()
        result = json.loads(result)
        return HttpResponse(json.dumps(result))
    except ValueError:
            print('Could not request data from server', ValueError)
            return HttpResponse({})


def grabContent(result, dataUsers, userlist, listUpdate):
    tempData = json.loads(result).get('data').get('children')
    for item in tempData:
        post = item.get('data')
        user = post.get('author')
        if listUpdate is True:
            userlist.append(user)
        print post.get('author')
        print post.get('id')
        print "/_____/"
        if dataUsers.get(user):
            dataUsers.get(user).update({post.get('id'): post})
        else:
            dataUsers.update({user: {post.get('id'): post}})


def getDataForUser(name, dataUsers, conn, idx, userlist):
    try:
        hdr = {'User-Agent': 'ololo bot'}
        url = '/user/' + name + '/.json'
        conn.request('GET', url, headers=hdr)
        result = conn.getresponse().read()
        userlist.remove(name)
        grabContent(result, dataUsers, userlist, False)

        print str(idx) + " iteration "
    except ValueError:
            print('Could not request for ', name)


def collectData(request):
    dataUsers = dict()
    userlist = []
    hdr = {'User-Agent': 'ololo bot'}
    conn = httplib.HTTPConnection('www.reddit.com')
    url = '/.json'
    conn.request('GET', url, headers=hdr)
    result = conn.getresponse().read()
    grabContent(result, dataUsers, userlist, True)

    for idx, user in enumerate(userlist):
        getDataForUser(user, dataUsers, conn, idx, userlist)

    conn.close()
    print len(str(dataUsers))
    model = UserListPost(title="user", data=str(dataUsers), date=datetime.datetime.now())
    model.save()
    return HttpResponse(json.dumps(dataUsers))


class BigData():
    def __init__(self):
        self.cache = {}

    def _reset(self):
        self.cache = {}

    def _set(self, data):
        print "caching..."
        self.cache["data"] = data

    def _get(self):
        print "returning from cache"
        return self.cache["data"]

    def _getLength(self):
        return len(self.cache)

dataCache = BigData()


def grabUserData(request):
    if dataCache._getLength() is 1:
        return HttpResponse(dataCache._get())
    else:
        item = UserListPost.objects.get(title="user")
        result = ast.literal_eval(item.data)
        dataCache._set(json.dumps(result))
        return HttpResponse(json.dumps(result))
    #json.dumps(data, default=dthandler)
