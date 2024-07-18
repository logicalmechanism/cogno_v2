def string_to_hex(s):
    return ''.join([hex(ord(c))[2:] for c in s])
