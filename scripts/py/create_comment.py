import json


def string_to_hex(s):
    return ''.join([hex(ord(c))[2:] for c in s])


def add_to_comments(comment):
    return {
        "bytes": comment
    }


def update_datum(comment_file, datum_file, redeemer_file):
    # Read thread.json
    with open(comment_file, 'r') as f:
        concatenated_string = ''.join(f.readlines())
    concatenated_string = concatenated_string.replace('\n', '\n\n')
    # print(repr(concatenated_string))

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


# Example usage
if __name__ == "__main__":
    update_datum('../thread/comment.txt', '../data/thread/updated-thread-datum.json',
                 '../data/thread/comment-redeemer.json')
