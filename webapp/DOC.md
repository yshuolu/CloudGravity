Path Definition

#App management

GET /	show app list
GET /app/:name	show app with name 
POST /app/new	create app
PUT /app/:name  modify specific app
DEL /app/:name  delete specific app  
POST /app/:name modify or delete specific app; include {del:true} to delete, otherwise modify
GET /createapp show app creation page

#Create level 1 billing

GET /admin/bill/:accessid