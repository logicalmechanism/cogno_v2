import argparse


def allowed_values(n: int, z: int) -> None:
    # n*x + (n+1)*y = z
    print(
        f"Find all solutions for {n} elements to fit inside {z} with {n + 1} spaces between:")
    for x in range(1, z):
        for y in range(1, z):
            if n * x + (n + 1) * y == z:
                print(f"Element Size: {x}, Space Size: {y}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Calculate grid spacing.')
    parser.add_argument('n', type=int, help='Number of elements')
    parser.add_argument('z', type=int, help='Total space size')

    args = parser.parse_args()

    allowed_values(args.n, args.z)
