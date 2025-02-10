# SCB Statement Converter

SCB Statement Converter is a tool to convert bank statements from SCB Bank in Thailand to CSV format. The CSV files can then be imported into Excel or Google Sheets for better bookkeeping and tracking of your spending.

## Features

- Converts SCB bank statements (PDF) into CSV format.
- Supports batch processing of multiple PDF files.
- Two usage options:
  1. Using a Docker image, which will give you a nice web UI.
  2. Running the Python script manually.

## Screenshot

## Installation and Usage Instructions

### Option 1: Using Docker / Docker Compose

#### Prerequisites
- Ensure you have [Docker](https://docs.docker.com/get-docker/) installed on your system.

#### Steps

1. Create a docker-compose.yaml file
   ```sh
   version: '3.8'
   services:
     scb-statement-converter:
       image: shlomki/scb-statement-converter:latest
       container_name: scb-statement-converter
       ports:
         - "2568:2568"
           restart: unless-stopped
   ```
2. Run ```docker compose up``` from your command line / shell
3. Open your browser and enter your docker container's IP with port 2568: ```http://docker-ip:2568``` or ```http://localhost:2568```
4. Upload or Drag & Drop an SCB PDF statement, enter the password for the file and click Upload & Convert
5. Click Download CSV

### Option 2: Running the Python Script Manually

#### Prerequisites

- Install [Python 3.11](https://www.python.org/downloads/)

#### Steps

1. Install required dependencies:
   ```sh
   pip install pypdf
   ```
2. Place all your SCB PDF statements in a folder.
3. Copy the file convert.py to that folder.
4. Using the command line / shell, run the script:

   ```sh
   python convert.py PDF_PASSWORD
   ```
   - Replace `PDF_PASSWORD` with the password required to open the SCB bank statements.

### Output

- The script will generate CSV files in the same directory as the PDF files.
- The CSV files can be opened in Excel, Google Sheets, or any other spreadsheet application.

## License

This project is licensed under the Apache License.
