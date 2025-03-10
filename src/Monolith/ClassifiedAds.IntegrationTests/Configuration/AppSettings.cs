﻿namespace ClassifiedAds.IntegrationTests.Configuration;

public class AppSettings
{
    public OpenIdConnect OpenIdConnect { get; set; }

    public ResourceServer WebAPI { get; set; }

    public LoginOptions Login { get; set; }

    public string DownloadsFolder { get; set; }
}
