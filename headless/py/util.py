def hex_to_string(h: str) -> str:
    """
    Convert a hexadecimal string to an ASCII string.

    Args:
        h (str): The hexadecimal string to convert.

    Returns:
        str: The resulting ASCII string.

    Examples:
        >>> hex_to_string('68656c6c6f')
        'hello'
        >>> hex_to_string('776f726c64')
        'world'
    """
    return bytes.fromhex(h).decode('ascii')


def string_to_hex(s: str) -> str:
    """
    Convert an ASCII string to a hexadecimal string.

    Args:
        s (str): The ASCII string to convert.

    Returns:
        str: The resulting hexadecimal string.

    Examples:
        >>> string_to_hex('hello')
        '68656c6c6f'
        >>> string_to_hex('world')
        '776f726c64'
    """
    return ''.join(format(ord(char), '02x') for char in s)


if __name__ == "__main__":
    import doctest
    doctest.testmod()
