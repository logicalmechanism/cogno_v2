def string_to_hex2(s):
    return ''.join([hex(ord(c))[2:] for c in s])


def hex_to_string(h):
    return bytes.fromhex(h).decode('ascii')


def string_to_hex(s: str) -> str:
    return ''.join(format(ord(char), '02x') for char in s)


# Example usage
if __name__ == "__main__":
    with open('../thread/comment.txt', 'r') as f:
        concatenated_string = ''.join(f.readlines())

    assert string_to_hex("https://i.imgur.com/JOKsNeT.jpeg") == string_to_hex2("https://i.imgur.com/JOKsNeT.jpeg")
    assert string_to_hex("This is a test string inside the test thread.") == string_to_hex2("This is a test string inside the test thread.")
    assert string_to_hex(concatenated_string) != string_to_hex2(concatenated_string)
