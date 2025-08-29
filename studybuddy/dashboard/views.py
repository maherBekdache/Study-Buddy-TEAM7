from django.shortcuts import render

def dashboard(request):
    return render(request, "dashboard.html")

def insights(request):
    return render(request, "insights.html")

def tasks(request):
    return render(request, "tasks.html")

def leaderboard(request):
    return render(request, "leaderboard.html")
