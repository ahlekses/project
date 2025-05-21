from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Factor, Survey, Question, SurveyAssignment, SurveyResponse
from .serializers import (
    FactorSerializer, SurveySerializer, QuestionSerializer,
    SurveyAssignmentSerializer, SurveyResponseSerializer,
    SurveyWithQuestionsSerializer, SurveySubmissionSerializer
)
from users.permissions import IsAdmin, IsHROfficer, IsEmployee


class FactorViewSet(viewsets.ModelViewSet):
    """
    API endpoint for survey factors. Only HR and admin can access.
    """
    queryset = Factor.objects.all()
    serializer_class = FactorSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin | IsHROfficer]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class SurveyViewSet(viewsets.ModelViewSet):
    """
    API endpoint for surveys. HR and admin can create and edit.
    """
    queryset = Survey.objects.all()
    serializer_class = SurveySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role in ['ADMIN', 'HR']:
            return Survey.objects.all()
        
        # Employees can only see surveys assigned to them
        return Survey.objects.filter(
            assignments__employee__user=user,
            assignments__is_completed=False
        )
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SurveyWithQuestionsSerializer
        return SurveySerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [permissions.IsAuthenticated, IsAdmin | IsHROfficer]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit survey responses."""
        survey = self.get_object()
        serializer = SurveySubmissionSerializer(data=request.data)
        
        if serializer.is_valid():
            assignment_id = serializer.validated_data.get('assignment_id')
            
            try:
                assignment = SurveyAssignment.objects.get(
                    id=assignment_id, 
                    survey=survey,
                    employee__user=request.user
                )
            except SurveyAssignment.DoesNotExist:
                return Response(
                    {'detail': 'Survey assignment not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Create responses
            responses = []
            for response_data in serializer.validated_data.get('responses', []):
                question_id = response_data.get('question_id')
                answer = response_data.get('answer')
                
                try:
                    question = Question.objects.get(id=question_id, survey=survey)
                except Question.DoesNotExist:
                    continue
                
                response, created = SurveyResponse.objects.update_or_create(
                    assignment=assignment,
                    question=question,
                    defaults={'answer': answer}
                )
                responses.append(response)
            
            # Mark assignment as completed
            assignment.is_completed = True
            assignment.completed_at = timezone.now()
            assignment.save()
            
            return Response({'status': 'survey submitted'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class QuestionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for survey questions. Only HR and admin can modify.
    """
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin | IsHROfficer]
    
    def get_queryset(self):
        survey_id = self.request.query_params.get('survey_id')
        if survey_id:
            return Question.objects.filter(survey_id=survey_id).order_by('order')
        return Question.objects.all().order_by('order')


class SurveyAssignmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for survey assignments.
    """
    queryset = SurveyAssignment.objects.all()
    serializer_class = SurveyAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role in ['ADMIN', 'HR']:
            if user.role == 'HR':
                # HR can see assignments for employees in their department
                return SurveyAssignment.objects.filter(
                    employee__user__department=user.department
                )
            return SurveyAssignment.objects.all()
        
        # Employees can only see their own assignments
        return SurveyAssignment.objects.filter(employee__user=user)
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [permissions.IsAuthenticated, IsAdmin | IsHROfficer]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        serializer.save(assigned_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_assignments(self, request):
        """Get current user's survey assignments."""
        assignments = SurveyAssignment.objects.filter(
            employee__user=request.user,
            is_completed=False
        )
        serializer = self.get_serializer(assignments, many=True)
        return Response(serializer.data)


class SurveyResponseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for survey responses.
    """
    queryset = SurveyResponse.objects.all()
    serializer_class = SurveyResponseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role in ['ADMIN', 'HR']:
            if user.role == 'HR':
                # HR can see responses for employees in their department
                return SurveyResponse.objects.filter(
                    assignment__employee__user__department=user.department
                )
            return SurveyResponse.objects.all()
        
        # Employees can only see their own responses
        return SurveyResponse.objects.filter(assignment__employee__user=user)