#!/usr/bin/env -S uv run --script
#
# /// script
# requires-python = ">=3.12"
# dependencies = [
#   "ruamel.yaml"
# ]
# ///

import argparse
from dataclasses import dataclass
from pathlib import Path
from ruamel.yaml import YAML


@dataclass
class ProgramArgs:
    """Typed program arguments."""

    tag: str


def parse_args():
    parser = argparse.ArgumentParser(description="Update the helm chart values preseving comments.")

    parser.add_argument("--tag", dest="tag")
    return parser.parse_args(namespace=ProgramArgs)


args: type[ProgramArgs] = parse_args()

values_path = Path("chart") / "values.yaml"
with open(values_path, "r+", encoding="utf-8") as f:
    yaml = YAML()
    yaml.preserve_quotes = True
    yaml.indent(mapping=2, sequence=4, offset=2)
    data = yaml.load(f.read())

    data["backend"]["tag"] = args.tag
    data["frontend"]["tag"] = args.tag

    f.seek(0)
    yaml.dump(data, f)

print(f"Done. {args.tag}")
