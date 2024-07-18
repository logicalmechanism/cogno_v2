import json

from util import string_to_hex


def wallet_type(pkh, sc):
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


def moderation_type(friend_list, restricted_user_list, restricted_thread_list):
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


def add_to_cogno(wallet, name, image, details, moderation):
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


def create_datum(cogno_file, wallet_file, datum_file):
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


def update_datum(current_datum, cogno_file, datum_file):
    with open(cogno_file, 'r') as f:
        cogno_data = json.load(f)

    current_datum['fields'][1]['fields'][0]['bytes'] = string_to_hex(cogno_data['name'])
    current_datum['fields'][1]['fields'][1]['bytes'] = string_to_hex(cogno_data['image'])
    current_datum['fields'][1]['fields'][2]['bytes'] = string_to_hex(cogno_data['details'])

    # Write back to datum.json
    with open(datum_file, 'w') as f:
        json.dump(current_datum, f, indent=2)


if __name__ == "__main__":
    create_datum('../cogno/cogno.json', '../wallets/user-1-wallet/payment.hash', '../data/cogno/cogno-datum.json')
