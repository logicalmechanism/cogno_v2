import json


def add_to_thread(title, content, image, category):
    return {
        "constructor": 0,
        "fields": [
            {
                "bytes": title
            },
            {
                "bytes": content
            },
            {
                "bytes": image
            },
            {
                "bytes": category
            },
            {
                "list": []
            },
            {
                "bytes": ""
            }
        ]
    }


def string_to_hex(s):
    return ''.join([hex(ord(c))[2:] for c in s])


def update_datum(thread_file, datum_file):
    # Read thread.json
    with open(thread_file, 'r') as f:
        thread_data = json.load(f)

    datum_data = add_to_thread(string_to_hex(thread_data['title']), string_to_hex(
        thread_data['content']), string_to_hex(thread_data['image']), string_to_hex(thread_data['category']))

    # Write back to datum.json
    with open(datum_file, 'w') as f:
        json.dump(datum_data, f, indent=2)


# Example usage
if __name__ == "__main__":
    update_datum('../thread/thread.json', '../data/thread/thread-datum.json')
