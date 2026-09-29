from django.http import HttpResponse

#view function
def welcome(request): 
    return HttpResponse("Welcome to the website!") 

def about(request):
    return HttpResponse("This is a practice website")