# Bharat-cab 
Blazing fast ride app. Movement is what we power. So when you think travel, think bharat-cab.

---

## Main business goals

- Connect users/passengers with nearby drivers.
- Real time tracking , Passenger can track ride on real time (through map).
- Efficient booking by marking pickup location and drop-off location. 
- Management of drivers and users.

---

## functional requirements

#### customers

- Customer should be able to pick source and destination of the ride 
- Customers should be able to get ETA and pricing information of ride .
- Customers should be able to book a cab to a destination.
- Customer should be able to cancel the ride
- Customers should be able to see the location of the driver.

#### Drivers

- Drivers should be able to accept or deny the customer requested ride.
- Once a driver accepts the ride, they should see the pickup location of the customer.
- Drivers should be able to mark the trip as complete on reaching the destination.

## Extended requirements

- Customers can rate the trip after it’s completed.
- Payment processing.

---

## Data model

![Bharat-cab-data-model](https://github.com/AkshayCdr/bharat-cab/blob/main/BCMv1.png?raw=true)


---

## Bharat cab work flow

1. Customer <ins> requests a ride </ins> by specifying the  source, destination  (payment method) etc.
2. Ride service register’s this request,<ins> finds nearby drivers </ins> , and <ins> calculates the estimated time of arrival (ETA) </ins>.
3. The request is then broadcast-ed to the nearby drivers for them to accept or deny.
4. If the driver accepts, the <ins> customer is notified about the live location of the driver</ins>.
5. The customer is picked up and the driver can start the trip.
6. Once the destination is reached, the driver will mark the ride as complete and collect payment.
7. After the payment is complete, the customer can leave a rating and feedback for the trip if they like.

---

## Api contracts 

### User

#### POST /users
`createUser` : creates new user 

 **Path params**
 
 **Body params**
 
```
{
  username: string,
  password: string,
  name: string,
  email: string,
  phone: number
}
```
 **Response**
 - New user created

 **Response Code**
 - 201 OK: created

----

#### GET /users/:id
`getUser` : get a specific user

 **Path params**

 - id: {userID}

 **Body params**
 
 **Response**
```
{
  username: string,
  email: string,
  phone: number,
}
```

 **Response Code**
 - 200 OK: 

----



#### POST /users/login
`userLogin` : authenticate user

 **Path params**
 
 **Body params**
```
{
  username: string,
  password: string,
}
```
 **Response**
 - Session cookies

 **Response Code**
 - 200 OK:

----




### Driver 


#### POST /drivers
`createDriver` : creates new driver

 **Path params**
 
 **Body params**
```
{
  username: string,
  password: string,
  name: string,
  email: string,
  phone: number,
}
```
 **Response**
 - New driver created

 **Response Code**
 - 201 OK: created

----


#### GET /drivers/:id
`getDriver` : get a specific driver

 **Path params**

 - id: {driverID}

 **Body params**
 
 **Response**
```
{
  username: string,
  email: string,
  phone: number,
  cab{
    type: string,
    regNo: number,
  }
}
```

 **Response Code**
 - 200 OK: 

----



#### PATCH /drivers/:id/status
`goOnline` : driver go online

 **Path params**
 
- id :{driverID}

 **Body params**
```
{
  status:"online",
  location: location<object>
}
```
 **Response**
 - Status updated

 **Response Code**
 - 200 OK: Driver status successfully updated

----



#### PATCH /drivers/:id/status
`goOnline` : driver go offline

 **Path params**
 
- id :{driverID}

 **Body params**
```
{
  status:"offline",
  location: location<object>
}
```
 **Response**
 - Status updated

 **Response Code**
 - 200 OK: Driver status successfully updated

----


### Cab

#### POST /cabs/:id
`createCab` : creates new cab

 **Path params**
 
 - id : {driver id}

 **Body params**
```
{
  type: string,
  regNo: number
}
```
 **Response**
 - New cab added

 **Response Code**
 - 201 OK: created

----


### Rides

- location object
```
{
  "location": {
    "latitude": number,
    "longitude": number
  },
}
```

#### GET /rides/estimates
`getRideDetails` : get ETA and price details of the ride 

 **Query params**
 
 - pickup_latitude: .
 - pickup_longitude: .
 - dropoff_latitude: .
 - dropoff_longitude: .

 **Body params**
 
 **Response**
```
{
  price:string,
  ETA:string  
}
```
 **Response Code**
- 200 OK: ETA and price estimate successfully retrieved.

----


#### POST /rides/:id
`requestRide` : request a new ride

 **Path params**
 
 - id: {user Id}

 **Body params**
 
```
{
  userID: uuid,
  source: location<object>,
  destination: location<object>
}
```
 **Response**
```
{
  rideID: uuid,
  status: string,
  driver:{
    name: string,
    phone: number,
    location: location<object>
    cab :{
      regNo: number,
      type: string
   }
}
}
```
 **Response Code**
- 201 Created: Ride request successfully created, and a nearby driver has been notified.

----






### Location








  
