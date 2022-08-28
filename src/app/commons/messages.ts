export class Messages {
  public static readonly ERROR_INVALID_OFFSET =
    "Invalid value. Expected X and Y values separated with comma. Example of correct value: '30,10'";

  public static readonly ERROR_STAGE_SIZE =
    "Invalid value. Expected width and height values separated with comma. Example of correct value: '500,300'";

  public static readonly ERROR_NO_FILE = 'No file uploaded';

  public static readonly ERROR_NOT_IMAGE =
    'Uploaded file is not an image. Check if it has got image extension.';

  public static readonly ERROR_NOT_JSON = 'Uploaded file is not an JSON file.';

  public static readonly ERROR_MISSING_DATA =
    "Uploaded file hasn't got all required data (stageX, stageY, background, shapes).";

    public static readonly CONFIRM_REMOVE_BACKGROUND ="Do you really want to remove the background from canvas?";
}
