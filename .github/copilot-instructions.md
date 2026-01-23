# Copilot Instructions

## General Guidelines
- If information is unclear or insufficient, ask for more details
- Keep responses short and direct
- Avoid over-engineering - only make changes that are directly requested
- Don't add features, refactor code, or make "improvements" beyond what was asked

## GitHub Issue Workflow

When solving a GitHub issue:

### AntAlmanac Project (ICSSC)

**Setup:**
- My fork: https://github.com/ronaldwen07/AntAlmanac
- Upstream: https://github.com/icssc/AntAlmanac
- Local repository: ~/Desktop/AntAlmanac

**Steps:**
1. Plan before implementing
2. Create a new branch for the fix
3. Implement the solution
4. **NO AI REFERENCES ANYWHERE** - Remove all:
   - Co-author lines
   - "Generated with Claude/Copilot" text
   - Any mention of AI/Claude/Copilot/Anthropic/OpenAI
5. Push to my fork (ronaldwen07/AntAlmanac)
6. Create PR to UPSTREAM (icssc/AntAlmanac), NOT my fork
7. Comment on the issue linking to the PR

### Cactus Project (cactus-compute)

**Setup:**
- My fork: https://github.com/ronaldwen07/cactus
- Upstream: https://github.com/cactus-compute/cactus
- Local repository: ~/Desktop/cactus

**Steps:**
1. Plan before implementing
2. Sync with upstream - `git fetch upstream && git rebase upstream/main`
3. Create a new branch for the fix
4. Implement the solution following C++20 standards
5. Run tests - `cactus test` (all must pass)
6. Sign commits with DCO - Use `git commit -s` for sign-off
7. **NO AI REFERENCES ANYWHERE**
8. Push to my fork (ronaldwen07/cactus)
9. Create PR to UPSTREAM (cactus-compute/cactus), NOT my fork
10. Comment on the issue linking to the PR

**Notes:**
- Project uses C++ (63.8%), C, Python, Kotlin, Dart (Flutter)
- Focus on ARM optimization and SIMD
- Benchmark changes if performance-critical

**Testing:**
- C++ tests are in `/tests/build/` - run individual tests like `./test_kernel`, `./test_graph`, etc.
- To rebuild after changes: `cd cactus/build && make` and `cd tests/build && make`

**Code Locations:**
- FFI/bindings: `cactus/ffi/`
- Flutter SDK: `flutter/cactus.dart`
- Utils: `cactus/ffi/cactus_utils.h`
