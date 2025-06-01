from google.cloud import storage

project_id = "gen-lang-client-0581836309"  # your GCP project ID
bucket_name = "your-bucket-name"  # replace with your bucket name
source_file = "phishing_data.csv"  # your local file
destination_blob = "phishing_data.csv"  # destination name in GCS

client = storage.Client(project=project_id)  # specify project here
bucket = client.bucket(bucket_name)
blob = bucket.blob(destination_blob)

blob.upload_from_filename(source_file)
print(f"Uploaded {source_file} to gs://{bucket_name}/{destination_blob}")
