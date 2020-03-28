'''
Author: Erik Marks (github.com/rekmarks)

Script for retrieving entity (contract, library, interface) names and
dependencies from the OpenZeppelin Solidity library.
'''

from os import walk, remove, path, makedirs
import json
import sys

def main():
    '''
    Gets takes a directory path and two output paths and returns metadata for
    all Solidity entities in the directory path and outputs results to the
    the output paths as JSON files.

    Expects 3 parameters from sys.argv, see function body.
    '''

    if len(sys.argv) != 4:
        raise ValueError(
            'Expected 3 parameters but received: ' + str(len(sys.argv) - 1)
        )

    solidity_root_path = sys.argv[1]
    metadata_path = sys.argv[2]
    filepaths_path = sys.argv[3]

    metadata, filepaths = getMetadata(solidity_root_path)

    # if run through PythonShell via Javascript, these are passed to the parent
    # Javascript process
    print(json.dumps(metadata, sort_keys=True))
    print(json.dumps(filepaths, sort_keys=True))

    # write metadata as JSON
    writeFile(filepaths_path, filepaths)
    writeFile(metadata_path, metadata)

def writeFile(filepath, data):

    # attempt to create directory if it doesn't exist
    directory = path.dirname(filepath)
    if not path.exists(directory): makedirs(directory)

    # create file and write data to it as JSON, deleting what's already there
    with open(filepath, 'w') as data_file:
        json.dump(data, data_file, indent=2, sort_keys=True)

# parse a contract, interface, or library from Solidity source file
def parseEntity(lines, entity_type, solidity_version, filename):

    entity_data = {
        'type': entity_type,
        'solidityVersion': solidity_version,
        'dependencies': set(),
    }

    for i in range(len(lines)):

        line = lines[i].split()
        imports = []

        if i == 0: # e.g. "contract ERC20 is BasicToken {"

            entity_data['name'] = line[1]

            if 'is' in line: # something is imported
                imports += line[line.index('is') + 1 : line.index('{')]

        # the other import keyword
        if line and line[0] == 'using':
            imports.append(line[1])

        if len(imports) == 0: continue

        # iterate over imports to add depdendencies
        for i in range(len(imports)):

            # current_import = imports[i].strip(string.punctuation)

            current_import = imports[i]
            if not current_import[-1].isalnum():
                current_import = current_import[:-1]

            # defensive programming
            if not current_import.isalnum():
                raise RuntimeError('non-alphanumeric import '
                    + current_import + ' for ' + filename)

            # add dependency
            entity_data['dependencies'].add(current_import)

    return entity_data

# Get dependencies
def getMetadata(root_path):

    metadata, filepaths = {}, {}

    # walk through openzeppelin directory
    for (dirpath, dirnames, filenames) in walk(root_path):

        # ignore mocks and examples, if using OpenZeppelin repo instead of npm dist
        if dirpath.endswith('mocks') or dirpath.endswith('examples'):
            continue

        # for filename in current directory
        for filename in filenames:

            # only check Solidity files
            if len(filename) < 5 or not filename.endswith('.sol'):
                continue

            # say no to deprecated contracts
            if filename.find('Deprecated') != -1:
                continue

            current_path = dirpath + '/' + filename

            # open Solidity file
            with open(current_path, 'r') as file:

                # file-level import statements are collected
                imports = []

                # lines of the current entity
                entityLines = []

                # flag for lines belonging to entity declarations
                lineIsEntity = False

                compiler_version, entity_type = '', ''

                for line in file:

                    if lineIsEntity:

                        entityLines.append(line)

                        # if end of entity declaration
                        if line.find('}') == 0:

                            # parse entity
                            entity_data = parseEntity(
                                entityLines,
                                entity_type,
                                compiler_version,
                                filename
                            )

                            entity_data['dependencies'].update(imports)
                            entity_data['dependencies'] = list(
                                entity_data['dependencies']
                            )
                            entity_data['dependencies'].sort()

                            # store entity metadata
                            metadata[entity_data['name']] = entity_data
                            filepaths[entity_data['name']] = current_path

                            # reset variables
                            lineIsEntity, entity_type = False, ''

                        continue

                    if line.find('library') == 0: entity_type = 'library'
                    elif line.find('contract') == 0: entity_type = 'contract'
                    elif line.find('interface') == 0: entity_type = 'interface'

                    # get solidity compiler version
                    elif line.find('pragma') == 0:
                        compiler_version = line.split()[-1]
                        compiler_version = compiler_version.split(';')[0]

                    # parse imports
                    elif line.find('import') == 0:

                        split_line = line.split('/')

                        current_import = split_line[-1]
                        current_import = current_import.split('.sol')[0]

                        if current_import in imports:
                            print('duplicate import:', current_import)
                            continue

                        imports.append(current_import)

                    # if line is an entity declaration, start collecting entity
                    # lines
                    if entity_type:

                        lineIsEntity = True
                        entityLines = [line]
                        continue

    return metadata, filepaths

main()
