Path Definition

#App management

GET /	show app list
GET /app/:name	show app with name 
POST /app/new	create app
PUT /app/:name  modify specific app
DEL /app/:name  delete specific app  
POST /app/:name modify or delete specific app; include {del:true} to delete, otherwise modify
GET /createapp show app creation page

#User order

POST /order/new 	  create new order
GET /order/:id  	  check order by order id
GET /order/preview/:name  preview order of app with name

#Admin

Admin use the same sign in interface as user
POST /admin/signup    		sign up new admin with invitaion code
POST /admin/invite    		create new invitation code
POST /admin/approve             finish order by order id


#Create level 1 billing

GET /admin/bill/:accessid


