---
applyTo: "**"
---

# GitHub Copilot Instructions
In backend:
- Write self-descriptive code without comments or explainations.
- Remove unused values/variables keep the code clean
- Don't write any comments!!! (Super important) No need to explain
- Use a single object argument for all functions and methods with named properties instead of multiple parameters, For example this is good: const function=(args:{arg1:string,arg2:number})=>{}
- Always think of reusability and modularity
- Don't import directly always import from the root of the repo
- Always work with interfaces first and then implement them. most of the times interfaces are already exist so check before you create new ones
- When creating new interface start with an "I" for example IParams
- Keep modules independent and avoid tight coupling between services
- Use dependency injection for services and repositories
- Write self-descriptive code without comments
- Log meaningful operations to easily trace the flow and find issues
- Always use config of nestjs
- Don't use any, always use types and interfaces
- Always use ULID for identifiers
- Always keep in mind OWASP security guidelines
- Always keep in mind scalability and performance
- Always keep in mind error handling and edge cases
- Always keep in mind sql injection and data validation 
- Always keep in mind idempotency
- Always keep in mind pagination if needed (using cursor if possible as we use ULID)
- Always think about edge cases and handle errors that might happen