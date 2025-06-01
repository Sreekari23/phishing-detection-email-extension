from google.cloud import bigquery

client = bigquery.Client()
query = """
SELECT * FROM `your_project.your_dataset.your_table` LIMIT 10
"""
results = client.query(query)
for row in results:
    print(row)
