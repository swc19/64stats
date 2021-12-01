## Internal API Documentation
---

The authenticated GET requests are due to smash.gg's API rate limits, as those requests utilize the API instead of the internal database.

### Events
    - GET /event/:id - Get all info from an event, using its id
    - GET /event/players/:id - Get all entrants from an event, using its id **(authenticated)**
    - POST /event/:id - Insert an event into database **(authenticated)**


### Players
    - GET /player/:id - Get all info from a player, using their user id
    - GET /player/events/:id - Get events that a player has entered, using their user id
    - GET /player/standings/:id - Gets all standings from a player, using their user id
    - POST /player/:id - Insert a player into database **(authenticated)**


### Sets
    - GET /set/:id - Get info about a set, using its id
    - GET /set/event/:id - Get all sets from an event, using the *event* id **(authenticated)**
    - POST /set/:id - Insert a set into database **(authenticated)**


### Standings
    - GET /standings/:id - Get standings from an event, using the event id
    - POST /standings/:id - Insert an event's standings into database **(authenticated)**


### Tournaments
    - GET /tournament/:id - Get all info from a tournament, using its id
    - GET /tournament/events/:id/ - Get all events from a tournament, using its id **(authenticated)**
    - POST /tournament/:id - Insert a tournament into database **(authenticated)**