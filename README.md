# SCB Statement Converter

SCB Statement Converter is a tool to convert PDF bank statements from SCB Bank in Thailand to CSV format. The CSV files can then be imported into Excel or Google Sheets for better bookkeeping and tracking of your spending.

[Click here to go to the converter](https://shlomki.github.io/scb-statement-converter/)

## Disclaimer

1. This tool is not affiliated, endorsed, or supported by SCB in any way, shape, or form. Use it at your own risk!
5. If SCB changes the format of their PDF statements, this tool will very likely stop working immediately.

## Features

- Converts SCB bank statements (PDF) into CSV format.
- **Performs the conversion right in your browser or on your machine**, your data stays safe as it doesn't get uploaded anywhere.
- Supports batch processing of multiple PDF files (by running the python script on your machine).

## Screenshot

<img src="https://github.com/shlomki/scb-statement-converter/blob/main/screenshots/webui.png?raw=true" alt="Web UI" width="720"/>

## Usage Instructions

### Option 1: Use the Web UI

#### Steps

1. Click [here](https://shlomki.github.io/scb-statement-converter/).
2. Choose your bank statement PDF file from SCB.
3. Enter the password for the PDF file.
4. Click "Convert to CSV".
5. Click "Download CSV".

### Option 2: Running the Python script locally on your machine

#### Prerequisites

- Install [Python 3.11](https://www.python.org/downloads/)
- Install required dependencies:
   ```sh
   pip install pypdf
   ```

#### Steps

2. Place all your SCB PDF statements in a folder.
3. Copy the file [convert.py](https://github.com/shlomki/scb-statement-converter/blob/main/convert.py) to that folder.
4. Using the command line / shell, run the script:

   ```sh
   python convert.py PDF_PASSWORD
   ```
   - Replace `PDF_PASSWORD` with the password required to open the SCB bank statements.

### Output

- The script will generate CSV files in the same directory as the PDF files.
- The CSV files can be opened in Excel, Google Sheets, or any other spreadsheet application.

### Problems?

If something isn't working for you, please check that you've followed the installation instructions first, and look at the logs / console window of the browser. Make sure you're using the right password for your PDFs by opening them up manually.

If you see an error in the logs and can't figure it out, please create a new issue, attach the logs, and I'll try to help as much as I can.

## License

This project is licensed under the Apache License.
