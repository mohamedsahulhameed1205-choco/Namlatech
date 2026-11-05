Namla\_Stays – Hotel Booking Website

About the Project



Namla\_Stays is a simple hotel booking web application developed to make finding and booking hotels easier.



Users can explore available hotels, search for hotels, filter them based on price, view hotel details, and book rooms online.



The application also has an admin section where the administrator can add, update, and delete hotel information.



This project is developed using React.js, Node.js, Express.js, and PostgreSQL.



Features

User Features

User registration and login

View available hotels

Search hotels by name

Filter hotels by minimum and maximum price

Sort hotels by price

View complete hotel details

Book hotel rooms

View personal booking details

Cancel bookings

Display 6 hotels per page using pagination

Admin Features

Admin login

Add new hotels

Edit existing hotel details

Delete hotels

Upload hotel images

Manage hotel information

Technologies Used

Frontend

React.js

JavaScript

HTML5

CSS3

Redux Toolkit

React Router

Backend

Node.js

Express.js

Database

PostgreSQL

Development Tools

Visual Studio Code

Postman

Git

GitHub

Project Structure

namlatech/

│

├── client/

│   ├── public/

│   ├── src/

│   │   ├── redux/

│   │   │   ├── hotelSlice.js

│   │   │   └── store.js

│   │   │

│   │   ├── App.jsx

│   │   ├── HotelDetails.jsx

│   │   ├── Login.jsx

│   │   ├── Register.jsx

│   │   ├── MyBookings.jsx

│   │   ├── style.css

│   │   └── main.jsx

│   │

│   └── package.json

│

├── server/

│   ├── routes/

│   ├── middleware/

│   ├── uploads/

│   ├── server.js

│   ├── .env

│   └── package.json

│

├── README.md

└── LICENSE



Note: The folder structure is a general representation. Update it if your actual project structure is different.



Installation and Setup

Step 1: Clone the Repository

git clone YOUR\_GITHUB\_REPOSITORY\_LINK

Step 2: Open the Project Folder

cd namlatech

Step 3: Install Frontend Dependencies

cd client

npm install

Step 4: Install Backend Dependencies



Open another terminal and run:



cd server

npm install

Step 5: Configure Environment Variables



Create a .env file inside the server folder.



Add the required configuration values, such as:



PORT=5000

DATABASE\_URL=your\_postgresql\_connection\_string

JWT\_SECRET=your\_secret\_key



Use the actual environment variable names expected by your backend code.



Do not share your database password or secret keys publicly.



Step 6: Start the Backend



From the server folder, run:



npm start

Step 7: Start the Frontend



Open another terminal:



cd client

npm run dev



Open the application in your browser:



http://localhost:5173



Backend API:



http://localhost:5000

Application Workflow



The application has two main roles:



User

Admin

1\. User Workflow

&#x20;       Start

&#x20;         |

&#x20;         v

&#x20;    Open Website

&#x20;         |

&#x20;         v

&#x20;   Register / Login

&#x20;         |

&#x20;         v

&#x20;    Home Page

&#x20;         |

&#x20;         v

&#x20;   View All Hotels

&#x20;         |

&#x20;         v

&#x20;  Search / Filter / Sort

&#x20;         |

&#x20;         v

&#x20;  Select a Hotel

&#x20;         |

&#x20;         v

&#x20;  View Hotel Details

&#x20;         |

&#x20;         v

&#x20;    Book a Room

&#x20;         |

&#x20;         v

&#x20;   Booking Success

&#x20;         |

&#x20;         v

&#x20;    My Bookings

&#x20;         |

&#x20;         v

&#x20;  View / Cancel Booking

&#x20;         |

&#x20;         v

&#x20;        End

2\. Admin Workflow

&#x20;       Start

&#x20;         |

&#x20;         v

&#x20;    Admin Login

&#x20;         |

&#x20;         v

&#x20;     Home Page

&#x20;         |

&#x20;         v

&#x20;    Admin Access

&#x20;         |

&#x20;         v

&#x20;    Manage Hotels

&#x20;         |

&#x20;         v

&#x20;   +-----+------+

&#x20;   |     |      |

&#x20;   v     v      v

&#x20;  Add   Edit   Delete

&#x20;Hotel  Hotel   Hotel

&#x20;   |     |      |

&#x20;   +-----+------+

&#x20;         |

&#x20;         v

&#x20;   Update Database

&#x20;         |

&#x20;         v

&#x20;        End



How the Application Works



Frontend



The frontend is developed using React.js.



It displays hotel information, login and registration forms, booking details, and admin options.



React Router is used for navigation between different pages. Redux Toolkit is used to manage hotel data.



Backend



The backend is developed using Node.js and Express.js.



It handles user authentication, hotel management, and booking-related API requests.



Database



PostgreSQL is used to store application data.



It maintains information related to users, hotels, and bookings.



Hotel Pagination



The home page displays a maximum of six hotels per page.



Users can navigate between pages using Previous, Next, and page number buttons.



Search, filtering, and sorting help users find hotels easily.



Future Enhancements

Online payment integration

Email booking confirmation

Hotel ratings and reviews

Advanced hotel search

Map-based hotel search

Improved mobile responsiveness

Developer



Mohamed Sahul Hameed S



BE Computer Science and Engineering



License



This project is licensed under the MIT License.



See the LICENSE file for details.

