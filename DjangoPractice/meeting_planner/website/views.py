from django.http import HttpResponse
from django.shortcuts import render

#view function
def welcome(request): 
    return HttpResponse("Welcome to the website!") 

def about(request):
    return HttpResponse("This is a practice website")

def view_calendar(request): #template with render
    return render(request, 'test.html')