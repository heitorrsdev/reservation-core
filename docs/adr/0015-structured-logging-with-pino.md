# ADR 0015: Structured Logging with Pino

## Context

The application needs production-ready observability. Up to this point, standard `console.log` and `console.error` methods (either directly or via generic NestJS Logger wrapping them natively) were being used. 

However, `console.log` presents several issues for a production environment:

1. **Lack of Structure:** Logs are emitted as raw strings, making them difficult to parse consistently by log aggregators (e.g., Datadog, CloudWatch, ELK).
2. **Blocking Operations:** Native Node.js console methods are synchronous and blocking under certain conditions, which limits throughput and degrades application performance under high load.
3. **Security and Privacy Risks:** Without an automated redaction system, critical PII (Personally Identifiable Information) such as `password`, `email`, or `refreshToken` can accidentally be leaked into log sinks, causing severe compliance and security violations.

A robust log infrastructure needs to enforce structure, improve performance, and protect sensitive data gracefully.

## Decision

We will use [`nestjs-pino`](https://github.com/iamolegga/nestjs-pino) and underlying [`pino-http`](https://github.com/pinojs/pino-http) for global application logging.

### Justification 

We chose Pino over other logging utilities like Winston or Morgan because:
1. **Performance/Throughput:** Pino has the lowest overhead in the Node.js ecosystem, using asynchronous fast-serialization strategies that minimize performance impact.
2. **Native JSON Formatting:** Pino natively outputs logs in newline-delimited JSON format (`ndjson`), which is explicitly required for easy and reliable ingestion into modern cloud aggregators.
3. **Built-in Redaction:** Pino has an extremely high-performance built-in data masking/redaction system, allowing us to specify paths (like `req.headers.authorization` or `req.body.password`) that handles PII omission out of the box.
4. **Developer Experience:** While JSON is great for machines, it's hard to read during development. Pino integrates neatly with `pino-pretty` to output formatted, colored logs in `dev` or non-production environments without modifying the underlying logging mechanics.

## Consequences

### Positive

* **High Observability:** A generated correlation ID allows requests to be traced logically throughout their entire lifecycle.
* **Privacy Compliance by Default:** The global logger configuration automatically intercepts and masks authentication, authorization hooks, passwords, and sensitive keys.
* **Aggregator Ready:** Directly fits with modern telemetry collectors without needing complex grok parsing logic.

### Negative

* **Strict Tooling Dependency:** `nestjs-pino` wraps NestJS' logger interface tightly. Teams must be mindful of using the injected `Logger` and avoiding global standard `console.*` scopes, as those will bypass the Pino formatter and correlation ID generator.
