import requests
import csv

api_url = "http://localhost:5000/api/location"

try:
    response = requests.get(api_url)
    if response.status_code == 200:
        data = response.json()
        csv_file = "test.csv"
        with open(csv_file, "w", newline="") as csvfile:
            fieldnames = ["_id","time","x", "y", "z","__v"]
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for item in data:
                writer.writerow(item)
        
        print(f"Data has written to {csv_file}")
    else:
        print("Something went wrong. Status code:", response.status_code)

except Exception as e:
    print("Error:", str(e))
