import json

from util import string_to_hex


def wallet_type(pkh: str, sc: str) -> dict[str, str]:
    """
    Create a wallet type dictionary with the given public key hash and smart contract.

    Args:
        pkh (str): The public key hash in hexadecimal string format.
        sc (str): The smart contract in hexadecimal string format.

    Returns:
        dict[str, str]: A dictionary representing the wallet type.

    Examples:
        >>> wallet_type('1234abcd', '5678efgh')
        {'constructor': 0, 'fields': [{'bytes': '1234abcd'}, {'bytes': '5678efgh'}]}
    """
    return {
        "constructor": 0,
        "fields": [
            {
                "bytes": pkh
            },
            {
                "bytes": sc
            }
        ]
    }


def moderation_type(friend_list: list[dict[str, str]], restricted_user_list: list[dict[str, str]], restricted_thread_list: list[dict[str, str]]) -> dict[str, str]:
    """
    Create a moderation type dictionary with the given friend list, restricted user list, and restricted thread list.

    Args:
        friend_list (list[dict[str, str]]): A list of friends.
        restricted_user_list (list[dict[str, str]]): A list of restricted users.
        restricted_thread_list (list[dict[str, str]]): A list of restricted threads.

    Returns:
        dict[str, str]: A dictionary representing the moderation type.

    Examples:
        >>> moderation_type(['alice', 'bob'], ['eve'], ['thread1', 'thread2'])
        {'constructor': 0, 'fields': [{'list': ['alice', 'bob']}, {'list': ['eve']}, {'list': ['thread1', 'thread2']}]}
    """
    return {
        "constructor": 0,
        "fields": [
            {
                "list": friend_list
            },
            {
                "list": restricted_user_list
            },
            {
                "list": restricted_thread_list
            }
        ]
    }


def add_to_cogno(wallet: dict[str, str], name: str, image: str, details: str, moderation: dict[str, str]) -> dict[str, str]:
    """
    Create a dictionary representing the addition of a wallet to Cogno with associated metadata.

    Args:
        wallet (dict[str, str]): A dictionary representing the wallet.
        name (str): The name associated with the wallet in hexadecimal string format.
        image (str): The image associated with the wallet in hexadecimal string format.
        details (str): The details associated with the wallet in hexadecimal string format.
        moderation (dict[str, str]): A dictionary representing moderation information.

    Returns:
        dict[str, str]: A dictionary representing the addition of the wallet to Cogno.

    Examples:
        >>> wallet = {'constructor': 0, 'fields': [{'bytes': '1234abcd'}, {'bytes': '5678efgh'}]}
        >>> moderation = {'constructor': 0, 'fields': [{'list': ['alice', 'bob']}, {'list': ['eve']}, {'list': ['thread1', 'thread2']}]}
        >>> add_to_cogno(wallet, '6e616d65', '696d616765', '64657461696c73', moderation)
        {'constructor': 0, 'fields': [{'constructor': 0, 'fields': [{'bytes': '1234abcd'}, {'bytes': '5678efgh'}]}, {'constructor': 0, 'fields': [{'bytes': '6e616d65'}, {'bytes': '696d616765'}, {'bytes': '64657461696c73'}]}, {'constructor': 0, 'fields': [{'list': ['alice', 'bob']}, {'list': ['eve']}, {'list': ['thread1', 'thread2']}]}]}
    """
    return {
        "constructor": 0,
        "fields": [
            wallet,
            {
                "constructor": 0,
                "fields": [
                    {
                        "bytes": name
                    },
                    {
                        "bytes": image
                    },
                    {
                        "bytes": details
                    }
                ]
            },
            moderation
        ]
    }


def create_datum(cogno_file: str, wallet_file: str, datum_file: str) -> None:
    """
    Create a datum file by combining data from a Cogno file and a wallet file.

    Args:
        cogno_file (str): The path to the JSON file containing Cogno data.
        wallet_file (str): The path to the file containing the public key hash (pkh).
        datum_file (str): The path to the output JSON file where the datum data will be written.

    Returns:
        None
    """
    with open(cogno_file, 'r') as f:
        cogno_data = json.load(f)

    with open(wallet_file, 'r') as file:
        pkh = file.readline().strip()

    datum_data = add_to_cogno(
        wallet_type(pkh, ""),
        string_to_hex(cogno_data['name']),
        string_to_hex(cogno_data['image']),
        string_to_hex(cogno_data['details']),
        moderation_type([], [], [])
    )

    # Write back to datum.json
    with open(datum_file, 'w') as f:
        json.dump(datum_data, f, indent=2)


def update_datum(current_datum: dict[str, str], cogno_file: str, datum_file: str) -> None:
    """
    Update the datum file with new data from a Cogno file.

    Args:
        current_datum (Dict[str, Any]): The current datum data to be updated.
        cogno_file (str): The path to the JSON file containing Cogno data.
        datum_file (str): The path to the output JSON file where the updated datum data will be written.

    Returns:
        None
    """
    with open(cogno_file, 'r') as f:
        cogno_data = json.load(f)

    current_datum['fields'][1]['fields'][0]['bytes'] = string_to_hex(cogno_data['name'])
    current_datum['fields'][1]['fields'][1]['bytes'] = string_to_hex(cogno_data['image'])
    current_datum['fields'][1]['fields'][2]['bytes'] = string_to_hex(cogno_data['details'])

    # Write back to datum.json
    with open(datum_file, 'w') as f:
        json.dump(current_datum, f, indent=2)


if __name__ == "__main__":
    import doctest
    doctest.testmod()
