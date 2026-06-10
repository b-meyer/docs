---
purpose: 'Documents support channels, response cadence, escalation path, and scope boundaries for this project.'
scope: 'Support model only — contributor workflow in CONTRIBUTING, security posture in SECURITY.'
audience: 'Contributors and consumers seeking help (primary); maintainers triaging reports (secondary).'
summary: 'GitHub Issues as the primary channel; private disclosure path for security; no commercial support (internal project); out-of-scope boundaries with Azure SWA platform and upstream deps; role split between maintainer, contributor, and consumer.'
---

# Support

## Channels

| Channel             | Purpose                                            | Response cadence                                                  |
| ------------------- | -------------------------------------------------- | ----------------------------------------------------------------- |
| GitHub Issues       | Bug reports, feature requests, questions           | Best effort; no SLA — typically within 14 days (internal project) |
| Security disclosure | Vulnerabilities — use private advisory (see below) | Acknowledged within 5 business days                               |

**Security reporting:** Do not open a public GitHub Issue for vulnerabilities. Use GitHub's private security advisory feature (Security → Advisories → New draft advisory) or contact the maintainer directly. See [SECURITY.md](SECURITY.md) for the project's security posture. If no acknowledgment arrives within 5 business days, the reporter may escalate to the repo owner directly via their GitHub profile (linked from the repository), or — as a last resort — open a public GitHub issue, noting that doing so waives confidentiality for the disclosure.

## Roles

| Role        | Responsibility                                                             |
| ----------- | -------------------------------------------------------------------------- |
| Maintainer  | Triages issues, merges PRs, manages releases                               |
| Contributor | Authors PRs; follows the pre-PR gate in [CONTRIBUTING.md](CONTRIBUTING.md) |
| Consumer    | Uses the framework to build sites; reports bugs against the framework API  |

## Escalation path

1. Search existing GitHub Issues for prior reports.
2. Open a new Issue with symptom, reproduction steps, and expected behavior.
3. For blockers: tag the repo owner in the Issue body (GitHub profile linked from the repository).

There is no paid support tier. This is an internal project with no public SLA.

## Commercial support

None. This is an internal project. There is no vendor, support contract, or guaranteed response time.

## Out of scope

Issues in the following areas belong upstream, not here:

- **Azure SWA platform** — outages, pricing, portal bugs → Azure support channels.
- **Vue / Vite / Vite+** — upstream framework bugs → their respective issue trackers.
- **Reka UI / Tailwind / mermaid** — dependency bugs → their respective repos.
- **Third-party tooling** — `vp` CLI bugs → Vite+ issue tracker.

## Industry References

- [GitHub Security Advisories](https://docs.github.com/en/code-security/security-advisories/working-with-repository-security-advisories/about-repository-security-advisories) — private disclosure mechanism.

_External URLs verified 2026-06-04._

## Cross-references

- [CONTRIBUTING.md](CONTRIBUTING.md) — contributor workflow and pre-PR gate.
- [SECURITY.md](SECURITY.md) — security posture and private disclosure detail.
