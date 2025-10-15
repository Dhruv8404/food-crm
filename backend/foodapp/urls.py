from django.urls import path
from . import views

urlpatterns = [
    path('menu/', views.menu_list, name='menu-list'),
    path('auth/customer/register/', views.customer_register, name='customer-register'),
    path('auth/customer/verify/', views.customer_verify, name='customer-verify'),
    path('auth/customer/login/', views.customer_login, name='customer-login'),
    path('auth/staff/login/', views.staff_login, name='staff-login'),
    path('auth/send-otp/', views.send_otp, name='send-otp'),
    path('auth/verify-otp/', views.verify_otp, name='verify-otp'),
    path('orders/', views.OrderListCreateView.as_view(), name='order-list-create'),
    path('orders/<str:pk>/', views.OrderUpdateView.as_view(), name='order-update'),
    path('tables/', views.list_tables, name='list-tables'),
    path('tables/generate/', views.generate_table, name='generate-table'),
    path('tables/verify/', views.verify_table, name='verify-table'),
    path('tables/<str:table_no>/delete/', views.delete_table, name='delete-table'),
]
