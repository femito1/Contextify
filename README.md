# zero-shot-classification

# ZERO SHOT CLASSIFICATION MODEL

## Overview  
This project provides a web-based application to predict the probability of a given text belonging to a set of provided candidate labels. The algorithm also offers a novel candidate label suggestion when none of the provided labels adequately fit the text. It supports both English and Italian entries.

## Prerequisites

- Node.js (v18 or later recommended)
- npm (comes with Node.js)
- Angular CLI (v19 or later)
- Python 3.12 (recommended)

## Features  
- **Text Classification:** Users can get the context of the text they enter.
- **Multilingual Support:** Application supports both English and Italian inputs, offering a variety to the user. 
- **User-Friendly Interface:** A web-based UI built using Flask and Angular for seamless interaction.

## Setup and Installation  

### **Step 1: Clone the Repository**  
```bash
git clone http://gitlab.pccube.com:8081/gitlab/codingcamp/aicodingcamp/examples/ai-camp-2/zero-shot-classification.git 
```
```bash
cd zero-shot-classification
```

### **Step 2: Create a Virtual Environment for backend**

To create a virtual environment using Conda, run the following commands:

```bash
cd backend
conda create --name zero_shot_app python=3.12 -y
conda activate zero_shot_app
```


## Step 3: Activate the virtual Environment & Install Dependencies

Once inside the Conda environment, install the required dependencies from `requirements.txt`:

```bash
pip install -r requirements.txt
```

## Step 4: Run the Flask Application

To start the Flask application, run the following command:

```bash
python application.py
```

The backend will be available at:

```
http://0.0.0.0:5000/
```

## Step 5: Create the Frontend server

To install the dependencies, create a new terminal and change the directory to the `zero-shot-classification`. Then, run the next commands:
```bash
cd frontend
npm install
```
## Step 6: Running the Frontend

To start the Angular development server, run:
```bash
ng serve
```

The backend will be available at:

```
http://0.0.0.0:4200/
```

### Proxy Configuration

The frontend is configured to proxy API requests to the backend server. This is handled through the `proxy.conf.json` file in the project root.
