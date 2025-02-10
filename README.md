# SCB Statement Converter

SCB Statement Converter is a tool to convert PDF bank statements from SCB Bank in Thailand to CSV format. The CSV files can then be imported into Excel or Google Sheets for better bookkeeping and tracking of your spending.

## Disclaimer

1. This tool is not affiliated, endorsed, or supported by SCB in any way, shape, or form. Use it at your own risk!
2. I have not made this tool into a public website on purpose. There are simply too many aspects of security and privacy involved. When using this tool locally, you are in charge of your own data.
3. DO NOT expose this tool externally to the public internet. It was not written with security in mind, and it could become an open door for hackers to collect your sensitive data.
4. I'm not a python developer originally, and I made this tool as a fun side project. The code is not perfect in any way, but it was fun to write and I'm sharing it here because it might be useful to other people.
5. If SCB changes the format of their PDF statements, this tool will very likely stop working immediately.

## Features

- Converts SCB bank statements (PDF) into CSV format.
- Supports batch processing of multiple PDF files.
- Two usage options:
  1. Using a Docker image, which will give you a nice web UI.
  2. Running the Python script manually.

## Screenshot

![Web UI](https://github.com/shlomki/scb-statement-converter/blob/main/screenshots/webui.png?raw=true)

## Installation and Usage Instructions

### Option 1: Use the Web UI by using Docker

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
3. Copy the file [convert.py](https://github.com/shlomki/scb-statement-converter/blob/main/scb_statement_converter/convert.py) to that folder.
4. Using the command line / shell, run the script:

   ```sh
   python convert.py PDF_PASSWORD
   ```
   - Replace `PDF_PASSWORD` with the password required to open the SCB bank statements.

### Output

- The script will generate CSV files in the same directory as the PDF files.
- The CSV files can be opened in Excel, Google Sheets, or any other spreadsheet application.

#### Problems?

If the tool isn't working for you, please check that you've followed the installation instructions first, and look at the logs. Also, it's a good idea to check that you're using the right password for your PDFs by opening them up manually.

If you see an error in the logs and can't figure it out, please create a new bug, attach the logs, and I'll try to help as much as I can.

## License

This project is licensed under the Apache License.
