from flask import Flask, request, jsonify, send_file, render_template
import os
import uuid
import time
from convert import process_pdf_file

app = Flask(__name__)
UPLOAD_FOLDER = '/app/scb_statement_converter/uploads'
CONVERTED_FOLDER = '/app/scb_statement_converter/converted'
info_log = True

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CONVERTED_FOLDER, exist_ok=True)

def delete_old_files_in_folder(folder):
    time_shreshold = time.time() - 3600  # 3600 seconds = 1 hour

    """Delete files older than 1 hour in the specified folder."""
    for filename in os.listdir(folder):
        file_path = os.path.join(folder, filename)
        if os.path.isfile(file_path):
            file_creation_time = os.path.getctime(file_path)
            if file_creation_time < time_shreshold:
                try:
                    os.remove(file_path)
                    if info_log:
                        print(f"Deleted old file: {file_path}")
                except Exception as e:
                    print(f"Error deleting {file_path}: {e}")

def delete_old_files():
    # Ensure the folders exist
    if os.path.exists(UPLOAD_FOLDER):
        delete_old_files_in_folder(UPLOAD_FOLDER)
    if os.path.exists(CONVERTED_FOLDER):
        delete_old_files_in_folder(CONVERTED_FOLDER)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    delete_old_files()

    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if 'password' in request.form:
        password = request.form['password']
    else:
        password = ""

    if info_log:
        print("Processing: " + file.filename)

    # Save the uploaded file
    file_id = str(uuid.uuid4())
    input_path = os.path.join(UPLOAD_FOLDER, file_id)
    file.save(input_path)

    # Placeholder for your conversion code
    output_path = os.path.join(CONVERTED_FOLDER, file_id + ".csv")

    try:
        processing_successful = process_pdf_file(input_path, output_path, password)
    except Exception as e:
        print('Error while processing PDF: %s', repr(e))
        
        if os.path.exists(input_path):
            os.remove(input_path) #Cleanup input file

        if os.path.exists(output_path):
            os.remove(output_path) #Cleanup output file

        return jsonify({'error': 'There was a problem processing your file. Make sure your password is correct. Check the server logs for more information.'}), 400

    # Delete the source file
    os.remove(input_path)

    if info_log:
        print(f"Processed: {file.filename} | Output File: {output_path} | Success: {processing_successful}")

    if not processing_successful:
        return jsonify({'error': 'There was a problem processing your file, we were unable to find data. Check the server logs for more information.'}), 400

    return jsonify({'file_id': file_id})

@app.route('/download/<file_id>', methods=['GET'])
def download_file(file_id):
    output_path = os.path.join(CONVERTED_FOLDER, file_id + ".csv")
    if not os.path.exists(output_path):
        return jsonify({'error': 'File not found'}), 404

    response = send_file(output_path, as_attachment=True)

    # Delete the converted file after download
    # os.remove(output_path)

    delete_old_files()
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=2568)