import json

from util import hex_to_string, string_to_hex


def add_to_thread(title, content, image, category, cogno):
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
                "bytes": cogno
            }
        ]
    }


def create_datum(thread_file, cogno_token, datum_file):
    with open(thread_file, 'r') as f:
        thread_data = json.load(f)

    datum_data = add_to_thread(
        string_to_hex(thread_data['title']),
        string_to_hex(thread_data['content']),
        string_to_hex(thread_data['image']),
        string_to_hex(thread_data['category']),
        cogno_token
    )

    # Write back to datum.json
    with open(datum_file, 'w') as f:
        json.dump(datum_data, f, indent=2)


def add_to_comments(comment):
    return {
        "bytes": comment
    }


def add_comment_to_datum(comment_file, datum_file, redeemer_file):
    # Read thread.json
    with open(comment_file, 'r') as f:
        concatenated_string = ''.join(f.readlines())

    comment_data = add_to_comments(string_to_hex(concatenated_string))
    with open(datum_file, 'r') as f:
        datum_data = json.load(f)

    with open(redeemer_file, 'r') as f:
        redeemer_data = json.load(f)

    redeemer_data['fields'][0]['bytes'] = comment_data['bytes']

    datum_data['fields'][4]['list'] = [comment_data] + datum_data['fields'][4]['list']

    # Write back to datum.json
    with open(datum_file, 'w') as f:
        json.dump(datum_data, f, indent=2)

    with open(redeemer_file, 'w') as f:
        json.dump(redeemer_data, f, indent=2)


def display(script_utxo_file, policy_id):
    with open(script_utxo_file, 'r') as f:
        data = json.load(f)

    utxos = list(data.keys())
    batch_size = 10

    try:
        for i in range(0, len(utxos), batch_size):
            for utxo in utxos[i:i + batch_size]:
                thread_token_name = list(data[utxo]['value'][policy_id].keys())[0]
                thread_title = data[utxo]['inlineDatum']['fields'][0]['bytes']
                print(f"\n\033[94mThread Token: {thread_token_name}\033[0m")
                print(f"\033[96mTitle: {hex_to_string(thread_title)}\033[0m")

            if i + batch_size < len(utxos):
                input("\nPress Enter to continue...")
    except KeyboardInterrupt:
        print("\nExiting...")
        return


# Example usage
if __name__ == "__main__":
    add_comment_to_datum(
        '../thread/comment.txt',
        '../data/thread/thread-datum.json',
        '../data/thread/comment-redeemer.json'
    )
