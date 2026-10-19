import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/** Memastikan nilai field sama dengan field lain (mis. passwordConfirm). */
export function Match(property: string, options?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'match',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: {
        message: 'konfirmasi password tidak sama dengan password',
        ...options,
      },
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const [related] = args.constraints as [string];
          return value === (args.object as Record<string, unknown>)[related];
        },
      },
    });
  };
}
