from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from accounts.models import CustomUser
from .serializers import UserSerializer

class UserListCreateView(generics.ListCreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

class UserRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
