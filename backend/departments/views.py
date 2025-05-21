from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Department
from .serializers import DepartmentSerializer
from users.permissions import IsAdmin


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for departments. Only admin can perform all operations.
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated, IsAdmin]