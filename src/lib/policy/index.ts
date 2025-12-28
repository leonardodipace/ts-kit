import type {
  Action,
  AllowParams,
  Conditions,
  Entity,
  ForbidParams,
  Rule,
} from "./types.js";

export class Policy {
  private rules: Rule[] = [];

  public allow<T>(params: AllowParams<T>) {
    this.rules.push({
      action: params.action,
      entity: params.entity,
      conditions: params.conditions,
      inverted: false,
    });
  }

  public forbid<T>(params: ForbidParams<T>) {
    this.rules.push({
      action: params.action,
      entity: params.entity,
      conditions: params.conditions,
      inverted: true,
    });
  }

  public can<T>(action: Action, entity: Entity, object?: T) {
    for (const rule of this.rules) {
      const matchesAction = rule.action === action;
      const matchesEntity = rule.entity === entity;

      if (!matchesAction || !matchesEntity) {
        continue;
      }

      if (!rule.conditions) {
        return !rule.inverted;
      }

      if (object && this.matchesConditions(object, rule.conditions)) {
        return !rule.inverted;
      }
    }

    return false;
  }

  private matchesConditions<T>(object: T, conditions: Conditions<T>) {
    for (const key in conditions) {
      const matchesConditions = object[key] === conditions[key];

      if (!matchesConditions) {
        return false;
      }
    }

    return true;
  }
}
