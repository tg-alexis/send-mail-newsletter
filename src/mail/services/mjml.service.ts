import { Injectable, Logger } from '@nestjs/common';
import { readFile } from 'fs/promises';
import * as Handlebars from 'handlebars';
import mjml2html from 'mjml';
import { join } from 'path';
import { MailTemplateException } from '../exceptions/mail.exception';

/**
 * Service to handle MJML template processing
 */
@Injectable()
export class MjmlService {
  private readonly logger = new Logger(MjmlService.name);
  private readonly templateCache: Map<string, Handlebars.TemplateDelegate> =
    new Map();
  private readonly templateDir: string;

  constructor() {
    // In production (Docker), templates are copied to dist folder by Nest CLI
    // In development, templates are in src folder
    const isProduction = process.env.NODE_ENV === 'production';
    const baseDir = isProduction
      ? join(process.cwd(), 'dist')
      : join(process.cwd(), 'src');
    this.templateDir = join(baseDir, 'mail/templates');
  }

  /**
   * Renders a MJML template with the given context variables
   * @param templateName - Name of the template without extension
   * @param context - Template variables
   * @returns Promise resolving to rendered HTML
   */
  async renderTemplate(
    templateName: string,
    context: Record<string, any>,
  ): Promise<string> {
    try {
      // Add current year to context if not provided
      if (!context.currentYear) {
        context.currentYear = new Date().getFullYear();
      }

      // Add environment-based URLs to context
      if (!context.assetsUrl) {
        context.assetsUrl =
          process.env.ASSETS_URL || `${context.apiUrl}/assets`;
      }

      // Try to get template from cache
      let template = this.templateCache.get(templateName);

      // If not in cache, load and compile it
      if (!template) {
        const mjmlContent = await this.loadMjmlTemplate(templateName);
        const htmlOutput = this.convertMjmlToHtml(mjmlContent);
        template = Handlebars.compile(htmlOutput);
        this.templateCache.set(templateName, template);
      }

      // Render the template with the provided context
      return template(context);
    } catch (error) {
      this.logger.error(
        `Failed to render MJML template "${templateName}"`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new MailTemplateException(
        templateName,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Loads a MJML template file
   * @param templateName - Template name without extension
   * @returns Promise resolving to MJML content
   * @private
   */
  private async loadMjmlTemplate(templateName: string): Promise<string> {
    try {
      const templatePath = join(
        this.templateDir,
        'emails',
        `${templateName}.mjml`,
      );
      return await readFile(templatePath, 'utf-8');
    } catch (error) {
      this.logger.error(
        `Failed to load MJML template file for "${templateName}"`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new MailTemplateException(
        templateName,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Converts MJML markup to HTML
   * @param mjmlContent - MJML content to convert
   * @returns HTML string
   * @private
   */
  private convertMjmlToHtml(mjmlContent: string): string {
    try {
      const result = mjml2html(mjmlContent, {
        validationLevel: 'strict',
        filePath: this.templateDir,
      });

      if (result.errors && result.errors.length > 0) {
        const errorMessages = result.errors
          .map((error) => `${error.line} - ${error.message}`)
          .join('\n');

        this.logger.warn(`MJML validation warnings:\n${errorMessages}`);
      }

      return result.html;
    } catch (error) {
      this.logger.error(
        'Failed to convert MJML to HTML',
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
