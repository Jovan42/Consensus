import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError as ClassValidatorError } from 'class-validator';
import { plainToClass, ClassConstructor } from 'class-transformer';

export function validateDto<T extends object>(dtoClass: ClassConstructor<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Transform plain object to class instance
      const dto = plainToClass(dtoClass, req.body);
      
      // Validate the DTO
      const errors = await validate(dto);
      
      if (errors.length > 0) {
        const errorMessages = errors.map((error: ClassValidatorError) => {
          const constraints = error.constraints;
          return constraints ? Object.values(constraints).join(', ') : 'Validation error';
        });
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errorMessages
        });
      }
      
      // Replace req.body with validated and transformed data
      req.body = dto;
      next();
    } catch (error) {
      console.error('Validation middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during validation'
      });
    }
  };
}
