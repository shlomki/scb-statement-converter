import sys
import csv
import os
from pypdf import PdfReader

info_log = True
debug_log = False

def process_text_to_csv(input_text, output_csv_file_path):

    data_start_marker = "รายการ/ช่องทาง"
    data_end_markers = ["www.scb.co.th", "Total amount"]
    data_skip_line = "Balance brought forward"

    # Split the input text into lines, skipping empty lines
    lines = [line.strip() for line in input_text.strip().split('\n') if line.strip()]

    # Prepare a list to store CSV rows
    csv_rows = []    

    i = 0
    read_lines = 0
    previous_balance = 0
    is_data_segment = False
    data_found = False

    while i < len(lines):

        #If we haven't reached the data segment
        if not is_data_segment:
            #If this is the data start marker
            if data_start_marker in lines[i]: 
                is_data_segment = True
                i += 1

                if data_skip_line in lines[i]:
                    i += 1
            else:
                #Keep looking
                i += 1

        #If we're in the data segment and we've reached one of the end markers
        if is_data_segment:
            for marker in data_end_markers:
                if marker in lines[i]:
                    is_data_segment = False

        if is_data_segment:
            data_found = True
            read_lines = 0
            # Ensure we have enough lines to process
            if i + 4 >= len(lines):
                break

            # Column 1: First word of the first line
            date = lines[i].split()[0]

            # Column 2 to Column 5: First 4 words from the second line
            words = lines[i+1].split()
            time, channel, amount, balance = words[:4]
            
            #Fix amount
            if previous_balance != 0:
                amount = previous_balance - float(balance.replace(",",""))

            # Description: Everything from the 5th word on the second line to the end of that line
            description = ' '.join(words[4:])

            # Column 6: All of the third line, and if necessary, the fourth line
            note = lines[i+2]  # Start with the third line
            read_lines = 3

            if i + 3 < len(lines) and lines[i+3] and 'DESC :' not in lines[i+3]:  # If there is a fourth line and it's not an end marker
                note += ' ' + lines[i+3]  # Add the fourth line
                read_lines += 1

            # Append the row to the list
            new_row = [date, time, channel, amount, balance, description, note]
            
            if debug_log:
                print(new_row)

            csv_rows.append(new_row)

            #Save the previous balance
            previous_balance = float(balance.replace(",",""))

            if 'DESC :' in lines[i+3]:
                read_lines += 1

            if 'NOTE :' in lines[i+4]:
                read_lines += 1

            if lines[i+5] == "":
                read_lines += 1

            # Skip read lines after the current data
            i += read_lines

    # Write the CSV rows to a file
    with open(output_csv_file_path, mode="a", encoding="utf-8", newline="") as file:
        writer = csv.writer(file)
        writer.writerows(csv_rows)

    return data_found

def process_pdf_file(input_file_path, output_file_path, password):
    data_found = False

    reader = PdfReader(input_file_path)
    if reader.is_encrypted:
        reader.decrypt(password)
    for page in reader.pages:
        text = page.extract_text()
        data_found = data_found or process_text_to_csv(text, output_file_path)
    
    return data_found

def process_pdf_files_in_directory(input_dir, output_dir, password):
    """
    Reads all .pdf files in the input directory and processes them into CSV files.
    :param input_dir: Directory containing .pdf files.
    :param output_dir: Directory to save the processed .csv files.
    """
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # List all .pdf files in the input directory
    pdf_files = [f for f in os.listdir(input_dir) if f.endswith(".pdf")]

    last_balance = 0
    for pdf_file in pdf_files:

        # Construct full file paths
        input_file_path = os.path.join(input_dir, pdf_file)
        output_file_path = os.path.join(output_dir, os.path.splitext(pdf_file)[0] + ".csv")

        #Open a new destination csv file
        with open(output_file_path, mode="w", encoding="utf-8", newline="") as file:
            writer = csv.writer(file)
            writer.writerow(["Date", "Time", "Channel", "Amount", "Balance", "Description", "Note"])  # CSV Header

        # Process the PDF file and save as a CSV file
        process_pdf_file(input_file_path, output_file_path, password)
        if info_log:
            print(f"Processed {pdf_file} -> {output_file_path}")


# Example usage
if __name__ == "__main__":
    input_directory = "."  # Replace with your input directory
    output_directory = "."  # Replace with your output directory
    password = sys.argv[1]

    process_pdf_files_in_directory(input_directory, output_directory, password)