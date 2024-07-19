import json

from util import hex_to_string, string_to_hex


def add_to_thread(title: str, content: str, image: str, category: str, cogno: str) -> dict[str, any]:
    """
    Create a dictionary representing the addition of a new thread with the given title, content, image, category, and cogno.

    Args:
        title (str): The title of the thread in hexadecimal string format.
        content (str): The content of the thread in hexadecimal string format.
        image (str): The image associated with the thread in hexadecimal string format.
        category (str): The category of the thread in hexadecimal string format.
        cogno (str): The cogno associated with the thread in hexadecimal string format.

    Returns:
        dict[str, any]: A dictionary representing the new thread.

    Examples:
        >>> add_to_thread('7469746c65', '636f6e74656e74', '696d616765', '63617465676f7279', '636f676e6f')
        {'constructor': 0, 'fields': [{'bytes': '7469746c65'}, {'bytes': '636f6e74656e74'}, {'bytes': '696d616765'}, {'bytes': '63617465676f7279'}, {'list': []}, {'bytes': '636f676e6f'}]}
    """
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


def create_datum(thread_file: str, cogno_token: str, datum_file: str) -> None:
    """
    Create a datum file by combining data from a thread file and a cogno token.

    Args:
        thread_file (str): The path to the JSON file containing thread data.
        cogno_token (str): The cogno token in hexadecimal string format.
        datum_file (str): The path to the output JSON file where the datum data will be written.

    Returns:
        None
    """
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


def add_to_comments(comment: str) -> dict[str, str]:
    """
    Create a dictionary representing a comment.

    Args:
        comment (str): The comment text in hexadecimal string format.

    Returns:
        Dict[str, str]: A dictionary containing the comment.

    Examples:
        >>> add_to_comments('636f6d6d656e74')
        {'bytes': '636f6d6d656e74'}
    """
    return {
        "bytes": comment
    }


def add_comment_to_datum(comment_file: str, datum_file: str, redeemer_file: str) -> None:
    """
    Add a comment to the datum and update the redeemer with the comment data.

    Args:
        comment_file (str): The path to the file containing the comment.
        datum_file (str): The path to the JSON file containing the datum data.
        redeemer_file (str): The path to the JSON file containing the redeemer data.

    Returns:
        None
    """
    # Read comment file
    with open(comment_file, 'r') as f:
        concatenated_string = ''.join(f.readlines())

    comment_data = add_to_comments(string_to_hex(concatenated_string))

    # Read datum file
    with open(datum_file, 'r') as f:
        datum_data = json.load(f)

    # Read redeemer file
    with open(redeemer_file, 'r') as f:
        redeemer_data = json.load(f)

    # Update redeemer with comment data
    redeemer_data['fields'][0]['bytes'] = comment_data['bytes']

    # Add comment to datum
    datum_data['fields'][4]['list'] = [comment_data] + datum_data['fields'][4]['list']

    # Write back to datum.json
    with open(datum_file, 'w') as f:
        json.dump(datum_data, f, indent=2)

    # Write back to redeemer.json
    with open(redeemer_file, 'w') as f:
        json.dump(redeemer_data, f, indent=2)


def display(script_utxo_file: str, policy_id: str) -> None:
    """
    Display the thread token names and titles from a UTXO JSON file in batches.

    Args:
        script_utxo_file (str): The path to the JSON file containing UTXO data.
        policy_id (str): The policy ID to extract thread token names.

    Returns:
        None
    """
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


if __name__ == "__main__":
    import doctest
    doctest.testmod()
